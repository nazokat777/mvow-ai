package uz.mentorai.focus.di

import android.content.Context
import androidx.room.Room
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import uz.mentorai.focus.BuildConfig
import uz.mentorai.focus.data.db.MentorDatabase
import uz.mentorai.focus.data.scheduled.ScheduledSessionDao
import uz.mentorai.focus.data.session.SessionDao
import uz.mentorai.focus.data.stats.DailyStatsDao
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): MentorDatabase =
        Room.databaseBuilder(
            context,
            MentorDatabase::class.java,
            MentorDatabase.DB_NAME
        )
            .apply {
                // Faqat DEBUG build'da schema o'zgarsa bazani qayta quramiz (dev qulayligi).
                // RELEASE'da bu YO'Q — ma'lumot o'chmasligi uchun. Versiya oshganda
                // .addMigrations(MIGRATION_n_n1) bilan migration yozish SHART.
                if (BuildConfig.DEBUG) {
                    fallbackToDestructiveMigration()
                }
            }
            .build()

    @Provides
    fun provideSessionDao(db: MentorDatabase): SessionDao = db.sessionDao()

    @Provides
    fun provideScheduledSessionDao(db: MentorDatabase): ScheduledSessionDao =
        db.scheduledSessionDao()

    @Provides
    fun provideDailyStatsDao(db: MentorDatabase): DailyStatsDao = db.dailyStatsDao()
}
