import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ItemsModule } from 'src/items/items.module';
import { UsersModule } from 'src/users/users.module';

import { SeedResolver } from './seed.resolver';
import { SeedService } from './seed.service';

@Module({
  providers: [SeedResolver, SeedService],
  imports: [ConfigModule, ItemsModule, UsersModule],
})
export class SeedModule {}
