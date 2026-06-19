import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt)
}

android {
    namespace = "uz.mentorai.focus"
    compileSdk = 35

    defaultConfig {
        applicationId = "uz.mentorai.focus"
        minSdk = 29
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // Anthropic API key (local.properties orqali). Production'da server proxy ishlatish kerak!
        val apiKey: String = run {
            val propsFile = rootProject.file("local.properties")
            if (propsFile.exists()) {
                val props = Properties()
                props.load(propsFile.inputStream())
                props.getProperty("ANTHROPIC_API_KEY", "")
            } else ""
        }
        buildConfigField("String", "ANTHROPIC_API_KEY", "\"$apiKey\"")
    }

    signingConfigs {
        create("release") {
            // Upload keystore (Play App Signing — Google manages app key, we keep upload key).
            // Sozlash: local.properties ga quyidagilarni qo'shing:
            //   MVOW_RELEASE_STORE_FILE=../keystore/mvow-upload.jks
            //   MVOW_RELEASE_STORE_PASSWORD=...
            //   MVOW_RELEASE_KEY_ALIAS=mvow-upload
            //   MVOW_RELEASE_KEY_PASSWORD=...
            val propsFile = rootProject.file("local.properties")
            if (propsFile.exists()) {
                val props = Properties().apply { load(propsFile.inputStream()) }
                val storeFilePath = props.getProperty("MVOW_RELEASE_STORE_FILE", "")
                if (storeFilePath.isNotEmpty()) {
                    storeFile = file(storeFilePath)
                    storePassword = props.getProperty("MVOW_RELEASE_STORE_PASSWORD", "")
                    keyAlias = props.getProperty("MVOW_RELEASE_KEY_ALIAS", "")
                    keyPassword = props.getProperty("MVOW_RELEASE_KEY_PASSWORD", "")
                }
            }
        }
    }

    buildTypes {
        debug {
            isMinifyEnabled = false
            applicationIdSuffix = ".debug"
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
    }

    bundle {
        language { enableSplit = false }
        density { enableSplit = true }
        abi { enableSplit = true }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
        freeCompilerArgs = freeCompilerArgs + listOf(
            "-opt-in=kotlin.RequiresOptIn",
            "-opt-in=androidx.compose.material3.ExperimentalMaterial3Api"
        )
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1,INDEX.LIST,DEPENDENCIES,LICENSE,LICENSE.txt,LICENSE.md,NOTICE,NOTICE.txt,NOTICE.md}"
        }
    }
}

// Room schema tarixini app/schemas/ ga eksport qilamiz (migration yozish uchun zarur).
ksp {
    arg("room.schemaLocation", "$projectDir/schemas")
}

dependencies {
    // Core
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    // LifecycleService (FocusGuardService uchun) — Hilt @AndroidEntryPoint Service'ni tanishi uchun
    implementation("androidx.lifecycle:lifecycle-service:2.8.7")
    implementation(libs.androidx.activity.compose)

    // Compose
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons)

    // Material Components — XML temalar uchun (Theme.Material3.DayNight.*)
    implementation("com.google.android.material:material:1.12.0")

    // Navigation
    implementation(libs.androidx.navigation.compose)

    // Hilt
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.hilt.navigation.compose)
    implementation(libs.hilt.work)
    ksp(libs.hilt.work.compiler)

    // Room
    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)

    // Coroutines
    implementation(libs.kotlinx.coroutines.android)

    // WorkManager
    implementation(libs.androidx.work.runtime.ktx)

    // Networking
    implementation(libs.retrofit)
    implementation(libs.retrofit.moshi)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.okhttp.sse)
    implementation(libs.moshi)

    // Storage
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.androidx.security.crypto)

    // Google Calendar
    implementation(libs.google.api.client)
    implementation(libs.google.api.services.calendar)

    // Testing
    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
    testImplementation(libs.turbine)
    testImplementation(libs.mockk)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))

    // Compose tooling
    debugImplementation(libs.androidx.compose.ui.tooling)
}
