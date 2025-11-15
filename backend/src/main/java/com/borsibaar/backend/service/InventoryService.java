package com.borsibaar.backend.service;

import com.borsibaar.backend.dto.*;
import com.borsibaar.backend.entity.Inventory;
import com.borsibaar.backend.entity.InventoryTransaction;
import com.borsibaar.backend.entity.Product;
import com.borsibaar.backend.entity.User;
import com.borsibaar.backend.mapper.InventoryMapper;
import com.borsibaar.backend.repository.InventoryRepository;
import com.borsibaar.backend.repository.InventoryTransactionRepository;
import com.borsibaar.backend.repository.ProductRepository;
import com.borsibaar.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InventoryMapper inventoryMapper;

    @Transactional(readOnly = true)
    public List<InventoryResponseDto> getByOrganization(Long organizationId) {
        return getByOrganization(organizationId, null);
    }

    @Transactional(readOnly = true)
    public List<InventoryResponseDto> getByOrganization(Long organizationId, Long categoryId) {
        List<Inventory> inventories;

        if (categoryId != null) {
            inventories = inventoryRepository.findByOrganizationIdAndCategoryId(organizationId, categoryId);
        } else {
            inventories = inventoryRepository.findByOrganizationId(organizationId);
        }

        return inventories.stream()
                .map(inv -> {
                    InventoryResponseDto base = inventoryMapper.toResponse(inv);
                    Product product = productRepository.findById(inv.getProductId())
                            .orElse(null);

                    if (product == null) return null;

                    String productName = product.getName();
                    BigDecimal unitPrice = Optional.ofNullable(inv.getAdjustedPrice())
                            .orElse(product.getBasePrice());

                    return new InventoryResponseDto(
                            base.id(),
                            base.organizationId(),
                            base.productId(),
                            productName,
                            base.quantity(),
                            unitPrice,
                            product.getBasePrice(),
                            product.getMinPrice(),
                            product.getMaxPrice(),
                            base.updatedAt()
                    );
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(InventoryResponseDto::productName))
                .toList();
    }

    @Transactional(readOnly = true)
    public InventoryResponseDto getByProductAndOrganization(Long productId, Long organizationId) {
        Inventory inventory = inventoryRepository
                .findByOrganizationIdAndProductId(organizationId, productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No inventory found for this product"));

        InventoryResponseDto base = inventoryMapper.toResponse(inventory);
        Product product = productRepository.findById(productId)
                .orElse(null);

        String productName = product != null ? product.getName() : "Unknown Product";
        BigDecimal unitPrice = BigDecimal.ZERO;
        BigDecimal basePrice = BigDecimal.ZERO;
        if (product != null) {
             unitPrice = Optional.ofNullable(inventory.getAdjustedPrice())
                    .orElse(product.getBasePrice());
             basePrice = product.getBasePrice();
        }

        return new InventoryResponseDto(
                base.id(),
                base.organizationId(),
                base.productId(),
                productName,
                base.quantity(),
                unitPrice,
                basePrice,
                product.getMinPrice(),
                product.getMaxPrice(),
                base.updatedAt()
        );
    }

    @Transactional
    public InventoryResponseDto addStock(AddStockRequestDto request, UUID userId, Long organizationId) {
        // Verify product exists and belongs to organization
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found"));

        if (!product.getOrganizationId().equals(organizationId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Product does not belong to your organization");
        }

        // Get or create inventory
        Inventory inventory = inventoryRepository
                .findByOrganizationIdAndProductId(organizationId, request.productId())
                .orElseGet(() -> {
                    Inventory newInv = new Inventory();
                    newInv.setOrganizationId(organizationId);
                    newInv.setProduct(product);
                    newInv.setQuantity(BigDecimal.ZERO);
                    newInv.setAdjustedPrice(product.getBasePrice());
                    newInv.setCreatedAt(OffsetDateTime.now());
                    newInv.setUpdatedAt(OffsetDateTime.now());
                    return inventoryRepository.save(newInv);
                });

        BigDecimal oldQuantity = inventory.getQuantity();
        BigDecimal newQuantity = oldQuantity.add(request.quantity());

        inventory.setQuantity(newQuantity);
        inventory.setUpdatedAt(OffsetDateTime.now());
        inventory = inventoryRepository.save(inventory);

        BigDecimal currentPrice = Optional.ofNullable(inventory.getAdjustedPrice()).orElse(product.getBasePrice());

        // Create transaction record
        createTransaction(inventory, "PURCHASE", request.quantity(),
                oldQuantity, newQuantity, currentPrice, currentPrice, null, request.notes(), userId);

        InventoryResponseDto base = inventoryMapper.toResponse(inventory);
        return new InventoryResponseDto(
                base.id(),
                base.organizationId(),
                base.productId(),
                product.getName(),
                base.quantity(),
                currentPrice,
                null,
                product.getMinPrice(),
                product.getMaxPrice(),
                base.updatedAt()
        );
    }

    @Transactional
    public InventoryResponseDto removeStock(RemoveStockRequestDto request, UUID userId, Long organizationId) {
        // Verify product exists and belongs to organization
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found"));

        if (!product.getOrganizationId().equals(organizationId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Product does not belong to your organization");
        }

        Inventory inventory = inventoryRepository
                .findByOrganizationIdAndProductId(organizationId, request.productId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No inventory found for this product"));

        BigDecimal oldQuantity = inventory.getQuantity();
        BigDecimal newQuantity = oldQuantity.subtract(request.quantity());

        if (newQuantity.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient stock. Available: " + oldQuantity + ", Requested: " + request.quantity());
        }

        inventory.setQuantity(newQuantity);
        inventory.setUpdatedAt(OffsetDateTime.now());
        inventory = inventoryRepository.save(inventory);

        BigDecimal currentPrice = Optional.ofNullable(inventory.getAdjustedPrice()).orElse(product.getBasePrice());

        // Create transaction record (negative quantity change)
        createTransaction(inventory, "ADJUSTMENT", request.quantity().negate(),
                oldQuantity, newQuantity, currentPrice, currentPrice, request.referenceId(), request.notes(), userId);

        InventoryResponseDto base = inventoryMapper.toResponse(inventory);
        return new InventoryResponseDto(
                base.id(),
                base.organizationId(),
                base.productId(),
                product.getName(),
                base.quantity(),
                currentPrice,
                null,
                product.getMinPrice(),
                product.getMaxPrice(),
                base.updatedAt()
        );
    }

    @Transactional
    public InventoryResponseDto adjustStock(AdjustStockRequestDto request, UUID userId, Long organizationId) {
        // Verify product exists and belongs to organization
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found"));

        if (!product.getOrganizationId().equals(organizationId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Product does not belong to your organization");
        }

        Inventory inventory = inventoryRepository
                .findByOrganizationIdAndProductId(organizationId, request.productId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No inventory found for this product"));

        BigDecimal oldQuantity = inventory.getQuantity();
        BigDecimal quantityChange = request.newQuantity().subtract(oldQuantity);

        inventory.setQuantity(request.newQuantity());
        inventory.setUpdatedAt(OffsetDateTime.now());
        inventory = inventoryRepository.save(inventory);

        BigDecimal currentPrice = Optional.ofNullable(inventory.getAdjustedPrice()).orElse(product.getBasePrice());

        // Create transaction record
        createTransaction(inventory, "ADJUSTMENT", quantityChange,
                oldQuantity, request.newQuantity(), currentPrice, currentPrice, null, request.notes(), userId);

        InventoryResponseDto base = inventoryMapper.toResponse(inventory);
        return new InventoryResponseDto(
                base.id(),
                base.organizationId(),
                base.productId(),
                product.getName(),
                base.quantity(),
                currentPrice,
                null,
                product.getMinPrice(),
                product.getMaxPrice(),
                base.updatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<InventoryTransactionResponseDto> getTransactionHistory(Long productId, Long organizationId) {
        Inventory inventory = inventoryRepository
                .findByOrganizationIdAndProductId(organizationId, productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No inventory found for this product"));

        List<InventoryTransaction> transactions = inventoryTransactionRepository
                .findByInventoryIdOrderByCreatedAtDesc(inventory.getId());

        // Get all unique user IDs (filter out nulls)
        List<UUID> userIds = transactions.stream()
                .map(InventoryTransaction::getCreatedBy)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        // Fetch all users at once
        Map<UUID, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        // Map transactions with user information
        return transactions.stream()
                .map(transaction -> {
                    User user = userMap.get(transaction.getCreatedBy());
                    return new InventoryTransactionResponseDto(
                            transaction.getId(),
                            transaction.getInventoryId(),
                            transaction.getTransactionType(),
                            transaction.getQuantityChange(),
                            transaction.getQuantityBefore(),
                            transaction.getQuantityAfter(),
                            transaction.getPriceBefore(),
                            transaction.getPriceAfter(),
                            transaction.getReferenceId(),
                            transaction.getNotes(),
                            transaction.getCreatedBy() != null ? transaction.getCreatedBy().toString() : null,
                            user != null ? user.getName() : null,
                            user != null ? user.getEmail() : null,
                            transaction.getCreatedAt() != null ? transaction.getCreatedAt().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME) : null
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSalesStatsResponseDto> getUserSalesStats(Long organizationId) {
        // Get all sale transactions for the organization
        List<InventoryTransaction> saleTransactions = inventoryTransactionRepository
                .findSaleTransactionsByOrganizationId(organizationId);

        // Group transactions by user and calculate statistics
        Map<UUID, List<InventoryTransaction>> transactionsByUser = saleTransactions.stream()
                .filter(t -> t.getCreatedBy() != null)
                .collect(Collectors.groupingBy(InventoryTransaction::getCreatedBy));

        // Get all users involved in sales
        List<UUID> userIds = new ArrayList<>(transactionsByUser.keySet());
        Map<UUID, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        // Calculate statistics for each user
        return transactionsByUser.entrySet().stream()
                .map(entry -> {
                    UUID userId = entry.getKey();
                    List<InventoryTransaction> userTransactions = entry.getValue();
                    User user = userMap.get(userId);

                    // Count unique sales (by referenceId)
                    long salesCount = userTransactions.stream()
                            .filter(t -> t.getReferenceId() != null)
                            .map(InventoryTransaction::getReferenceId)
                            .distinct()
                            .count();

                    // Calculate total revenue by getting all products and their prices
                    BigDecimal totalRevenue = userTransactions.stream()
                            .map(transaction -> {
                                // Get inventory to find product
                                return inventoryRepository.findById(transaction.getInventoryId())
                                        .flatMap(inventory -> productRepository.findById(inventory.getProductId()))
                                        .map(product -> {
                                            // Calculate revenue for this transaction
                                            BigDecimal quantitySold = transaction.getQuantityChange().abs();
                                            return product.getBasePrice().multiply(quantitySold);
                                        })
                                        .orElse(BigDecimal.ZERO);
                            })
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return new UserSalesStatsResponseDto(
                            userId.toString(),
                            user != null ? user.getName() : "Unknown User",
                            user != null ? user.getEmail() : "unknown@email.com",
                            salesCount,
                            totalRevenue
                    );
                })
                .sorted((a, b) -> Long.compare(b.salesCount(), a.salesCount())) // Sort by sales count desc
                .toList();
    }

    private void createTransaction(Inventory inventory, String type, BigDecimal quantityChange,
                                   BigDecimal quantityBefore, BigDecimal quantityAfter,
                                   BigDecimal priceBefore, BigDecimal priceAfter,
                                   String referenceId, String notes, UUID userId) {
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setInventory(inventory);
        transaction.setTransactionType(type);
        transaction.setQuantityChange(quantityChange);
        transaction.setQuantityBefore(quantityBefore);
        transaction.setQuantityAfter(quantityAfter);
        transaction.setPriceBefore(priceBefore);
        transaction.setPriceAfter(priceAfter);
        transaction.setReferenceId(referenceId);
        transaction.setNotes(notes);
        transaction.setCreatedBy(userId);
        transaction.setCreatedAt(OffsetDateTime.now());
        inventoryTransactionRepository.save(transaction);
    }
}
