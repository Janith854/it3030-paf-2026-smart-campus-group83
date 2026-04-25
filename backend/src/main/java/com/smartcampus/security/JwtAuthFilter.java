package com.smartcampus.security;

import com.smartcampus.model.User;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.isTokenValid(token)) {
                Claims claims = jwtUtil.extractClaims(token);
                String userId = claims.getSubject();
                String roleStr = claims.get("role", String.class);
                String email = claims.get("email", String.class);

                if (userId != null && roleStr != null) {
                    try {
                        User.Role role = User.Role.valueOf(roleStr);
                        UserPrincipal principal = new UserPrincipal(userId, email, role);
                        UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        request.setAttribute("userId", userId);
                    } catch (IllegalArgumentException e) {
                        // Log invalid role and continue without authentication
                        logger.warn("Invalid role in JWT: " + roleStr);
                    }
                }
            }
        }
        chain.doFilter(request, response);
    }
}
