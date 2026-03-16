import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseModule } from './common/modules/supabase.module';
import { CacheModule } from './common/modules/cache.module';
import { EmbeddingModule } from './common/modules/embedding.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { MembersModule } from './modules/members/members.module';
import { HomepageModule } from './modules/homepage/homepage.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { UploadModule } from './modules/upload/upload.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { EventsModule } from './modules/events/events.module';
import { ConsultationModule } from './modules/consultation/consultation.module';
import { SearchModule } from './modules/search/search.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
// Week 8 modules
import { AutomationModule } from './modules/automation/automation.module';
import { AiModule } from './modules/ai/ai.module';
import { EmailModule } from './modules/email/email.module';
import { RssModule } from './modules/rss/rss.module';
import { OpsModule } from './modules/ops/ops.module';
import { AdminModule } from './modules/admin/admin.module';
// Week 10 modules
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // Shared global singletons — must come before feature modules
    SupabaseModule,
    CacheModule,
    EmbeddingModule,
    // Feature modules
    HealthModule,
    AuthModule,
    TaxonomyModule,
    MembersModule,
    HomepageModule,
    // Week 3 modules
    ApplicationsModule,
    UploadModule,
    ArticlesModule,
    EventsModule,
    ConsultationModule,
    SearchModule,
    DashboardModule,
    // Week 8 modules
    AutomationModule,
    AiModule,
    EmailModule,
    RssModule,
    OpsModule,
    AdminModule,
    // Week 10 modules
    SchedulerModule,
  ],
})
export class AppModule {}
