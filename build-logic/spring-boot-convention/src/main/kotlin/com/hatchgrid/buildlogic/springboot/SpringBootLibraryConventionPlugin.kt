package com.hatchgrid.buildlogic.springboot

import com.hatchgrid.buildlogic.common.ConventionPlugin
import com.hatchgrid.buildlogic.common.extensions.catalogBundle
import com.hatchgrid.buildlogic.common.extensions.catalogPlugin
import com.hatchgrid.buildlogic.common.extensions.commonExtensions
import com.hatchgrid.buildlogic.common.extensions.commonTasks
import org.gradle.api.Project
import org.gradle.kotlin.dsl.apply
import org.gradle.kotlin.dsl.dependencies

private const val IMPLEMENTATION = "implementation"

class SpringBootLibraryConventionPlugin : ConventionPlugin {
    override fun Project.configure() {
        apply(plugin = catalogPlugin("kotlin-jvm").get().pluginId)
        apply(plugin = catalogPlugin("kotlin-spring").get().pluginId)

        with(extensions) {
            commonExtensions()
        }

        tasks.commonTasks()

        dependencies {
            add(IMPLEMENTATION, catalogBundle("spring-boot"))

            add(IMPLEMENTATION, catalogBundle("kotlin-jvm"))

            add(IMPLEMENTATION, catalogBundle("jackson"))

            add("testImplementation", catalogBundle("spring-boot-test"))
        }
    }
}
