package com.hatchgrid.common.domain.bus

/**
 * RequestHandlerDelegate<TRequest, TResponse> represents to Command, Query or Notification handler
 */
typealias RequestHandlerDelegate<TRequest, TResponse> = suspend (TRequest) -> TResponse
