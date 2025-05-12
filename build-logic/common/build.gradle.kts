plugins {
    `kotlin-dsl`
}

group = "com.hatchgrid.buildlogic.common"
version = extra["app.plugins.version"].toString()

dependencies {
    implementation(libs.gradle.kotlin)
}
