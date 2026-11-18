begin;

-- Scores are public ESPN data, so signed-out visitors can read them. This only
-- adds SELECT for `anon`: writes still go exclusively through the
-- service_role-only record_*_observation functions.
grant select on
  public.football_games, public.football_score_changes,
  public.baseball_games, public.baseball_score_changes,
  public.mens_basketball_games, public.mens_basketball_score_changes,
  public.womens_basketball_games, public.womens_basketball_score_changes
to anon;

create policy football_games_public_read on public.football_games for select to anon using (true);
create policy football_score_changes_public_read on public.football_score_changes for select to anon using (true);
create policy baseball_games_public_read on public.baseball_games for select to anon using (true);
create policy baseball_score_changes_public_read on public.baseball_score_changes for select to anon using (true);
create policy mens_basketball_games_public_read on public.mens_basketball_games for select to anon using (true);
create policy mens_basketball_score_changes_public_read on public.mens_basketball_score_changes for select to anon using (true);
create policy womens_basketball_games_public_read on public.womens_basketball_games for select to anon using (true);
create policy womens_basketball_score_changes_public_read on public.womens_basketball_score_changes for select to anon using (true);

commit;
