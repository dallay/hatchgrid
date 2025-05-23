package com.hatchgrid

import com.hatchgrid.thryve.TestcontainersConfiguration
import org.springframework.boot.fromApplication
import org.springframework.boot.with


fun main(args: Array<String>) {
    fromApplication<HatchgridApplication>().with(TestcontainersConfiguration::class).run(*args)
}
