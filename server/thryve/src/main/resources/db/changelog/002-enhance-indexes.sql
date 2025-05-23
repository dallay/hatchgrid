--liquibase formatted sql

--changeset hatchgrid:2 labels:indexing context:schema_enhancement
-- preconditions onFail:MARK_RAN

-- Index on organizations.user_id
-- precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'idx_organizations_user_id' AND tablename = 'organizations'
CREATE INDEX idx_organizations_user_id ON organizations(user_id);
-- rollback DROP INDEX idx_organizations_user_id;

-- Index on teams.organization_id
-- precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'idx_teams_organization_id' AND tablename = 'teams'
CREATE INDEX idx_teams_organization_id ON teams(organization_id);
-- rollback DROP INDEX idx_teams_organization_id;

-- Index on teams.name
-- precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'idx_teams_name' AND tablename = 'teams'
CREATE INDEX idx_teams_name ON teams(name);
-- rollback DROP INDEX idx_teams_name;

-- Index on team_members.user_id
-- precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'idx_team_members_user_id' AND tablename = 'team_members'
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
-- rollback DROP INDEX idx_team_members_user_id;

-- Index on subscribers.organization_id
-- precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'idx_subscribers_organization_id' AND tablename = 'subscribers'
CREATE INDEX idx_subscribers_organization_id ON subscribers(organization_id);
-- rollback DROP INDEX idx_subscribers_organization_id;

-- Index on forms.name
-- precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'idx_forms_name' AND tablename = 'forms'
CREATE INDEX idx_forms_name ON forms(name);
-- rollback DROP INDEX idx_forms_name;
