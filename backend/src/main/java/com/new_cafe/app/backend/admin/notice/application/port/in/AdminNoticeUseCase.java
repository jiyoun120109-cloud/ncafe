package com.new_cafe.app.backend.admin.notice.application.port.in;

import com.new_cafe.app.backend.admin.notice.application.command.*;
import com.new_cafe.app.backend.admin.notice.application.result.NoticeDetailResult;
import com.new_cafe.app.backend.admin.notice.application.result.NoticeListResult;

import java.util.Optional;

/**
 * 관리자 공지사항 유스케이스
 */
public interface AdminNoticeUseCase {

    NoticeListResult getNoticeList(NoticeListCommand command);

    Optional<NoticeDetailResult> getNotice(GetNoticeCommand command);

    NoticeDetailResult createNotice(CreateNoticeCommand command);

    Optional<NoticeDetailResult> updateNotice(UpdateNoticeCommand command);

    Optional<NoticeDetailResult> togglePin(Long id);

    Optional<NoticeDetailResult> getPrev(Long currentId);

    Optional<NoticeDetailResult> getNext(Long currentId);

    void deleteNotice(Long id);

    void deleteNotices(java.util.List<Long> ids);
}
