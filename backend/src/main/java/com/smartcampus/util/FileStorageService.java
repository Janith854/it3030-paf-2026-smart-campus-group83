package com.smartcampus.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

/**
 * TODO Member 3: wire this into TicketServiceImpl for image uploads
 */
@Service
public class FileStorageService {

    @Value("${app.upload-dir}")
    private String uploadDir;

    public String saveFile(MultipartFile file) throws IOException {
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadDir).resolve(filename);
        Files.createDirectories(path.getParent());
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        return filename;
    }

    public void deleteFile(String filename) throws IOException {
        Path path = Paths.get(uploadDir).resolve(filename);
        Files.deleteIfExists(path);
    }
}
