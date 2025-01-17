import { registerEnumType } from '@nestjs/graphql';

export enum ValidRoles {
  admin = 'admin',
  user = 'user',
  superUser = 'superUser',
}

registerEnumType(ValidRoles, {
  name: 'ValidRoles',
  description:
    'Consequat id consectetur eiusmod qui eiusmod veniam amet id amet in reprehenderit.',
});
