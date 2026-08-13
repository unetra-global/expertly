import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { AutomationModule } from './modules/automation/automation.module';
import { AiModule } from './modules/ai/ai.module';
import { EmailModule } from './modules/email/email.module';
import { OpsModule } from './modules/ops/ops.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    ApplicationsModule,
    UploadModule,
    ArticlesModule,
    EventsModule,
    ConsultationModule,
    SearchModule,
    DashboardModule,
    AutomationModule,
    AiModule,
    EmailModule,
    OpsModule,
    NewsletterModule,
  ],
})
export class AppModule { }
