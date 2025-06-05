package com.marouane.ecom.user;

import com.marouane.ecom.common.PageResponse;
import com.marouane.ecom.order.OrderRepository;
import com.marouane.ecom.order.OrderService;
import com.marouane.ecom.product.CustomerCountDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final CustomerMapper customerMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;


    public PageResponse<CustomerDTO> getAllCustomers(
            int page, int size,
            String sortBy, String sortDir,
            String search) {

        // Create Sort object
        Sort sort = Sort.by("createdAt").descending();
        if (sortBy != null && sortDir != null) {
            sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        // Build specification for filtering
        Specification<User> spec = Specification.where(
                (root, query, cb) -> cb.notEqual(root.join("roles").get("name"), "ADMIN")
        );

        if (search != null && !search.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("firstName")), "%" + search.toLowerCase() + "%"),
                            cb.like(cb.lower(root.get("lastName")), "%" + search.toLowerCase() + "%"),
                            cb.like(cb.lower(root.get("email")), "%" + search.toLowerCase() + "%")
                    )
            );
        }



        Page<User> userPage = userRepository.findAll(spec, pageable);

        List<CustomerDTO> responses = userPage.getContent().stream()
                .map(customerMapper::mapToCustomerDTO)
                .toList();

        return new PageResponse<>(
                responses,
                userPage.getNumber(),
                userPage.getSize(),
                (int) userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.isFirst(),
                userPage.isLast()
        );
    }

    private boolean isCustomer(User user) {
        return user.getRoles().stream()
                .noneMatch(role -> role.getName().equals("ADMIN"));
    }


    public CustomerCountDTO getCustomerCounts() {
        Specification<User> customerSpec = Specification.where(
                (root, query, cb) -> cb.notEqual(root.join("roles").get("name"), "ADMIN")
        );
        long total = userRepository.count(customerSpec);


        LocalDateTime firstOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        Specification<User> newThisMonthSpec = customerSpec.and(
                (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), firstOfMonth)
        );
        long newThisMonth = userRepository.count(newThisMonthSpec);

        return CustomerCountDTO.builder()
                .total(total)
                .newThisMonth(newThisMonth)
                .build();
    }




    public CustomerRequest addCustomer(CustomerRequest customerDTO) {
        if (userRepository.existsByEmail(customerDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User customer = customerMapper.mapToUser(customerDTO);


        customer.setPassword(passwordEncoder.encode("123456789"));

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new IllegalStateException("USER role not found in database"));
        customer.setRoles(List.of(userRole));

        User savedCustomer = userRepository.save(customer);

        return customerDTO;
    }


    public CustomerDTO updateCustomer(Integer customerId, CustomerDTO customerDTO) {
        User existingCustomer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        if (!existingCustomer.getEmail().equals(customerDTO.getEmail()) &&
                userRepository.existsByEmail(customerDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        existingCustomer.setFirstName(customerDTO.getFirstName());
        existingCustomer.setLastName(customerDTO.getLastName());
        existingCustomer.setEmail(customerDTO.getEmail());


        User updatedCustomer = userRepository.save(existingCustomer);


        return customerMapper.mapToCustomerDTO(updatedCustomer);
    }



    public void deleteCustomer(Integer customerId) {
        if (!userRepository.existsById(customerId)) {
            throw new IllegalArgumentException("Customer not found");
        }


        userRepository.deleteById(customerId);
    }


}
