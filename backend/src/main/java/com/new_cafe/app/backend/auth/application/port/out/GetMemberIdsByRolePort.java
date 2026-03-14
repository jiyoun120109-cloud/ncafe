package com.new_cafe.app.backend.auth.application.port.out;

import java.util.List;

public interface GetMemberIdsByRolePort {

    List<Long> findUserIdsByRole(String role);
}
