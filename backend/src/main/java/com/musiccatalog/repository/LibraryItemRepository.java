package com.musiccatalog.repository;

import com.musiccatalog.entity.LibraryItem;
import com.musiccatalog.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LibraryItemRepository extends JpaRepository<LibraryItem, Long> {

    Page<LibraryItem> findByUser(User user, Pageable pageable);

    List<LibraryItem> findByUser(User user);

    Optional<LibraryItem> findByIdAndUser(Long id, User user);

    boolean existsByUserAndAppleCatalogId(User user, Long appleCatalogId);

    long countByUser(User user);
}
