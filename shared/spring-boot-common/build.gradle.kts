import com.hatchgrid.buildlogic.common.extensions.implementation

plugins {
    id("app.spring.boot.library.convention")
}

dependencies {
    implementation(project(":shared:common"))
    implementation(libs.spring.boot.starter.data.r2dbc)
    implementation(libs.commons.text)
    implementation("org.springframework.security:spring-security-core:6.3.1")
    testImplementation(kotlin("test"))
    testImplementation(libs.faker)
    testImplementation(libs.mockk)
}

tasks.withType<Test> {
    useJUnitPlatform()
}
