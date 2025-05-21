package com.hatchgrid

import com.hatchgrid.ApplicationStartupTraces.initApplication
import com.hatchgrid.common.domain.Service
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.FilterType

@SpringBootApplication
@ConfigurationPropertiesScan
@ComponentScan(
    includeFilters = [
        ComponentScan.Filter(
            type = FilterType.ANNOTATION,
            classes = [Service::class],
        ),
    ],
)
class HatchgridApplication

private val log: Logger = LoggerFactory.getLogger(HatchgridApplication::class.java)

fun main(args: Array<String>) {
    val environment = runApplication<HatchgridApplication>(args = args).environment
    initApplication(environment)

    if (log.isInfoEnabled) {
        log.info(ApplicationStartupTraces.of(environment))
    }
}
