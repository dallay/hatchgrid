package com.hatchgrid.common.domain.bus

interface DependencyProvider {
    fun <T> getSingleInstanceOf(clazz: Class<T>): T

    fun <T>getSubTypesOf(clazz: Class<T>): Collection<Class<T>>
}
