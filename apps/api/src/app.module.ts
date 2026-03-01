import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { MembersModule } from './modules/members/members.module';
import { HomepageModule } from './modules/homepage/homepage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    HealthModule,
    AuthModule,
    TaxonomyModule,
    MembersModule,
    HomepageModule,
  ],
})
export class AppModule {}
