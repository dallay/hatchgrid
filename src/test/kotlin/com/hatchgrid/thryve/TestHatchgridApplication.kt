package com.hatchgrid.thryve

import org.springframework.boot.fromApplication
import org.springframework.boot.with


fun main(args: Array<String>) {
    fromApplication<HatchgridApplication>().with(TestcontainersConfiguration::class).run(*args)
}
