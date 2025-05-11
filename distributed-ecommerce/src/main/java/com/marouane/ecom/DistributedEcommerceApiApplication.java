package com.marouane.ecom;

import com.marouane.ecom.user.Role;
import com.marouane.ecom.user.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DistributedEcommerceApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(DistributedEcommerceApiApplication.class, args);
	}

//	@Bean
//	public CommandLineRunner runner(RoleRepository roleRepository) {
//		return args -> {
//			if(roleRepository.findByName("USER").isEmpty()){
//				roleRepository.save(
//						Role.builder().name("USER").build()
//				);
//			}
//		};
//	}
}
