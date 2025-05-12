plugins {
    `kotlin-dsl`
}

group = "com.hatchgrid.buildlogic.library"
version = extra["app.plugins.version"].toString()

dependencies {
    implementation(libs.gradle.kotlin)
    implementation(project(":common"))
}

gradlePlugin {
    plugins {
        register("library-convention") {
            id = "app.library.convention"
            implementationClass = "com.hatchgrid.buildlogic.library.LibraryConventionPlugin"
        }
    }
}
