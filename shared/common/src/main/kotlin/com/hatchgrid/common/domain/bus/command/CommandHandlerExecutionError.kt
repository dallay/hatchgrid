package com.hatchgrid.common.domain.bus.command

class CommandHandlerExecutionError(cause: Throwable) : RuntimeException(cause)
