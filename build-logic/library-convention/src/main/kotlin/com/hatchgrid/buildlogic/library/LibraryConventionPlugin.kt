package com.hatchgrid.buildlogic.library

import com.hatchgrid.buildlogic.common.ConventionPlugin
import com.hatchgrid.buildlogic.common.extensions.catalogBundle
import com.hatchgrid.buildlogic.common.extensions.catalogPlugin
import com.hatchgrid.buildlogic.common.extensions.commonExtensions
import com.hatchgrid.buildlogic.common.extensions.commonTasks
import org.gradle.api.Project
import org.gradle.kotlin.dsl.apply
import org.gradle.kotlin.dsl.dependencies

class LibraryConventionPlugin : ConventionPlugin {
    override fun Project.configure() {
        apply(plugin = catalogPlugin("kotlin-jvm").get().pluginId)

        with(extensions) {
            commonExtensions()
        }

        tasks.commonTasks()

        dependencies {

            add("implementation", catalogBundle("kotlin-jvm"))
            add("implementation", catalogBundle("jackson"))
        }

//      testing {
//        suites {
//          // Configure the built-in test suite
//          val test by getting(JvmTestSuite::class) {
//            // Use JUnit Jupiter test framework
//            useJUnitJupiter("5.9.1")
//          }
//        }
//      }
    }
}
