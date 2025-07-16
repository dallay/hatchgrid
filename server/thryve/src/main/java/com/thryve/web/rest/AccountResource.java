package com.thryve.web.rest;

import com.thryve.service.dto.UserDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AccountResource {

    @PostMapping("/account/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void registerAccount(@Valid @RequestBody UserDTO userDTO) {
        // TODO: implement registration logic
    }
}
