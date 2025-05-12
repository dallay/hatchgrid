package com.hatchgrid.common.domain.bus.command

interface CommandHandler<T : Command> {
    suspend fun handle(command: T)
}
