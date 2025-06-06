plugins {
    `kotlin-dsl`
}

group = "com.hatchgrid.buildlogic.springboot"
version = extra["app.plugins.version"].toString()

dependencies {
    implementation(libs.gradle.kotlin)
    implementation(project(":common"))
}

gradlePlugin {
    plugins {
        register("spring-boot-convention") {
            id = "app.spring.boot.convention"
            implementationClass = "com.hatchgrid.buildlogic.springboot.SpringBootConventionPlugin"
        }
        register("spring-boot-library-convention") {
            id = "app.spring.boot.library.convention"
            implementationClass = "com.hatchgrid.buildlogic.springboot.SpringBootLibraryConventionPlugin"
        }
    }
}
