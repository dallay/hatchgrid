plugins {
    `kotlin-dsl`
}

group = "com.hatchgrid.buildlogic.analysis"
version = extra["app.plugins.version"].toString()

dependencies {
    implementation(libs.gradle.detekt)
    implementation(libs.gradle.owasp.depcheck)
    implementation(project(":common"))
}

gradlePlugin {
    plugins {
        register("detekt") {
            id = "app.detekt"
            implementationClass = "com.hatchgrid.buildlogic.analysis.AppDetektPlugin"
        }
        register("owasp-dependency-check") {
            id = "app.owasp.dependency.check"
            implementationClass = "com.hatchgrid.buildlogic.analysis.AppOwaspPlugin"
        }
    }
}
