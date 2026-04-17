package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

/** Member 3 — add queries for technician assignment, category filter */
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByReportedByUserId(String userId);
    List<Ticket> findByAssignedTechnicianId(String technicianId);
    List<Ticket> findByStatus(Ticket.TicketStatus status);
    List<Ticket> findByPriority(Ticket.Priority priority);
    List<Ticket> findByCategory(String category);
    List<Ticket> findByStatusAndPriority(Ticket.TicketStatus status, Ticket.Priority priority);
}
