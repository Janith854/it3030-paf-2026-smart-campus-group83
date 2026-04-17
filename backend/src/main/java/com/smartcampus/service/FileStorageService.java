package com.smartcampus.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface FileStorageService {
    String storeFile(MultipartFile file);
    List<String> storeFiles(List<MultipartFile> files);
    void deleteFile(String fileName);
}
