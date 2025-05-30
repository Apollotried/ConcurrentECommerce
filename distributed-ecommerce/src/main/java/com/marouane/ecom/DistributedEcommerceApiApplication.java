package com.marouane.ecom;

import com.marouane.ecom.auth.AuthenticationRequest;
import com.marouane.ecom.auth.AuthenticationService;
import com.marouane.ecom.auth.RegistrationRequest;
import com.marouane.ecom.user.Role;
import com.marouane.ecom.user.RoleRepository;
import com.marouane.ecom.user.User;
import com.marouane.ecom.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@SpringBootApplication
public class DistributedEcommerceApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(DistributedEcommerceApiApplication.class, args);
	}

	@Bean
	public CommandLineRunner runner(RoleRepository roleRepository,
									UserRepository userRepository,
									AuthenticationService authenticationService) {
		return args -> {
			Role adminRole = roleRepository.findByName("ADMIN")
					.orElseGet(() -> roleRepository.save(Role.builder().name("ADMIN").build()));

			RegistrationRequest request = new RegistrationRequest(
					"test",
					"test",
					"admin@gmail.com",
					"123456789"
			);
			if (userRepository.findByEmail("admin@gmail.com").isEmpty()){
				authenticationService.registerAdmin(request);
			}
			;

		};
	}
}
