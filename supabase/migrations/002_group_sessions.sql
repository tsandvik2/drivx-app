-- Group sessions for group challenges
create table if not exists group_sessions (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references profiles(id) not null,
  challenge_text text not null,
  challenge_difficulty text not null default 'easy',
  participant_ids uuid[] not null default '{}',
  loser_id uuid references profiles(id),
  punishment_text text,
  proof_url text,
  pts_earned int not null default 10,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Notifications for in-app alerts (push via Capacitor later)
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  type text not null default 'general',
  title text not null,
  body text not null,
  data jsonb,
  read boolean not null default false,
  created_at timestamptz default now()
);

-- RLS for group_sessions
alter table group_sessions enable row level security;

create policy "Users can view sessions they participate in"
  on group_sessions for select
  using (auth.uid() = host_id or auth.uid() = any(participant_ids));

create policy "Users can create sessions"
  on group_sessions for insert
  with check (auth.uid() = host_id);

create policy "Host can update their sessions"
  on group_sessions for update
  using (auth.uid() = host_id);

-- RLS for notifications
alter table notifications enable row level security;

create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can insert notifications for others"
  on notifications for insert
  with check (true);

create policy "Users can update their own notifications"
  on notifications for update
  using (auth.uid() = user_id);

-- Function to award points to all participants in a group session
create or replace function complete_group_session(
  session_id uuid,
  loser uuid default null,
  proof text default null
) returns void as $$
declare
  sess record;
  pid uuid;
begin
  -- Get the session
  select * into sess from group_sessions where id = session_id;
  if not found then raise exception 'Session not found'; end if;

  -- Update session
  update group_sessions set
    completed_at = now(),
    loser_id = loser,
    proof_url = proof
  where id = session_id;

  -- Award points to host
  update profiles set
    pts = pts + sess.pts_earned,
    done_count = done_count + 1
  where id = sess.host_id;

  -- Award points to all participants
  foreach pid in array sess.participant_ids loop
    update profiles set
      pts = pts + sess.pts_earned,
      done_count = done_count + 1
    where id = pid;

    -- Insert completion record
    insert into completions (user_id, challenge_text, photo_url, pts_earned)
    values (pid, sess.challenge_text, proof, sess.pts_earned);

    -- Send notification
    insert into notifications (user_id, type, title, body, data)
    values (
      pid,
      'group_complete',
      'Gruppeutfordring fullfort!',
      sess.challenge_text,
      json_build_object('session_id', session_id::text, 'pts', sess.pts_earned::text)::jsonb
    );
  end loop;

  -- Insert completion for host too
  insert into completions (user_id, challenge_text, photo_url, pts_earned)
  values (sess.host_id, sess.challenge_text, proof, sess.pts_earned);
end;
$$ language plpgsql security definer;
