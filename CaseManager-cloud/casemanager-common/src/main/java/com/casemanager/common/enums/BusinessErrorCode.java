package com.casemanager.common.enums;

import com.casemanager.common.api.IErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 业务错误码枚举
 * 错误码规范：
 * - 10000-19999：通用错误
 * - 20000-29999：用户相关错误
 * - 30000-39999：项目相关错误
 * - 40000-49999：测试用例相关错误
 * - 50000-59999：测试计划相关错误
 * - 60000-69999：缺陷相关错误
 * - 70000-79999：报告相关错误
 * - 80000-89999：系统相关错误
 * - 90000-99999：其他错误
 */
@Getter
@AllArgsConstructor
public enum BusinessErrorCode implements IErrorCode {
    
    // ========== 通用错误 10000-19999 ==========
    PARAM_ERROR(10001, "参数错误"),
    DATA_NOT_FOUND(10002, "数据不存在"),
    DATA_ALREADY_EXISTS(10003, "数据已存在"),
    DATA_SAVE_ERROR(10004, "数据保存失败"),
    DATA_UPDATE_ERROR(10005, "数据更新失败"),
    DATA_DELETE_ERROR(10006, "数据删除失败"),
    FILE_NOT_FOUND(10007, "文件不存在"),
    FILE_UPLOAD_ERROR(10008, "文件上传失败"),
    FILE_DOWNLOAD_ERROR(10009, "文件下载失败"),
    FILE_DELETE_ERROR(10010, "文件删除失败"),
    FILE_FORMAT_ERROR(10011, "文件格式错误"),
    FILE_SIZE_EXCEED(10012, "文件大小超出限制"),
    OPERATION_NOT_ALLOWED(10013, "操作不允许"),
    OPERATION_FAILED(10014, "操作失败"),
    DATA_VALIDATION_ERROR(10015, "数据验证失败"),
    DUPLICATE_KEY_ERROR(10016, "数据重复"),
    
    // ========== 用户相关错误 20000-29999 ==========
    USER_NOT_FOUND(20001, "用户不存在"),
    USER_ALREADY_EXISTS(20002, "用户已存在"),
    USER_PASSWORD_ERROR(20003, "用户密码错误"),
    USER_DISABLED(20004, "用户已被禁用"),
    USER_LOCKED(20005, "用户已被锁定"),
    USER_EXPIRED(20006, "用户已过期"),
    USER_NOT_LOGIN(20007, "用户未登录"),
    USER_TOKEN_INVALID(20008, "用户令牌无效"),
    USER_TOKEN_EXPIRED(20009, "用户令牌已过期"),
    USER_PERMISSION_DENIED(20010, "用户权限不足"),
    USER_ROLE_NOT_FOUND(20011, "用户角色不存在"),
    USER_EMAIL_EXISTS(20012, "邮箱已被使用"),
    USER_PHONE_EXISTS(20013, "手机号已被使用"),
    USER_OLD_PASSWORD_ERROR(20014, "原密码错误"),
    USER_PASSWORD_SAME(20015, "新密码不能与原密码相同"),
    
    // ========== 项目相关错误 30000-39999 ==========
    PROJECT_NOT_FOUND(30001, "项目不存在"),
    PROJECT_ALREADY_EXISTS(30002, "项目已存在"),
    PROJECT_NAME_DUPLICATE(30003, "项目名称重复"),
    PROJECT_CODE_DUPLICATE(30004, "项目编码重复"),
    PROJECT_MEMBER_EXISTS(30005, "项目成员已存在"),
    PROJECT_MEMBER_NOT_FOUND(30006, "项目成员不存在"),
    PROJECT_PERMISSION_DENIED(30007, "无项目权限"),
    PROJECT_STATUS_ERROR(30008, "项目状态错误"),
    PROJECT_ARCHIVED(30009, "项目已归档"),
    PROJECT_DELETED(30010, "项目已删除"),
    
    // ========== 测试用例相关错误 40000-49999 ==========
    TEST_CASE_NOT_FOUND(40001, "测试用例不存在"),
    TEST_CASE_ALREADY_EXISTS(40002, "测试用例已存在"),
    TEST_CASE_NAME_DUPLICATE(40003, "测试用例名称重复"),
    TEST_CASE_FOLDER_NOT_FOUND(40004, "测试用例目录不存在"),
    TEST_CASE_FOLDER_NOT_EMPTY(40005, "测试用例目录不为空"),
    TEST_CASE_STATUS_ERROR(40006, "测试用例状态错误"),
    TEST_CASE_IMPORT_ERROR(40007, "测试用例导入失败"),
    TEST_CASE_EXPORT_ERROR(40008, "测试用例导出失败"),
    TEST_CASE_EXECUTE_ERROR(40009, "测试用例执行失败"),
    TEST_CASE_STEP_ERROR(40010, "测试步骤错误"),
    
    // ========== 测试计划相关错误 50000-59999 ==========
    TEST_PLAN_NOT_FOUND(50001, "测试计划不存在"),
    TEST_PLAN_ALREADY_EXISTS(50002, "测试计划已存在"),
    TEST_PLAN_NAME_DUPLICATE(50003, "测试计划名称重复"),
    TEST_PLAN_STATUS_ERROR(50004, "测试计划状态错误"),
    TEST_PLAN_CASE_NOT_FOUND(50005, "测试计划用例不存在"),
    TEST_PLAN_CASE_ALREADY_EXISTS(50006, "测试计划用例已存在"),
    TEST_PLAN_EXECUTE_ERROR(50007, "测试计划执行失败"),
    TEST_PLAN_FINISHED(50008, "测试计划已结束"),
    TEST_PLAN_NOT_STARTED(50009, "测试计划未开始"),
    TEST_PLAN_MEMBER_NOT_FOUND(50010, "测试计划成员不存在"),
    
    // ========== 缺陷相关错误 60000-69999 ==========
    DEFECT_NOT_FOUND(60001, "缺陷不存在"),
    DEFECT_ALREADY_EXISTS(60002, "缺陷已存在"),
    DEFECT_TITLE_DUPLICATE(60003, "缺陷标题重复"),
    DEFECT_STATUS_ERROR(60004, "缺陷状态错误"),
    DEFECT_ASSIGN_ERROR(60005, "缺陷分配失败"),
    DEFECT_CLOSE_ERROR(60006, "缺陷关闭失败"),
    DEFECT_REOPEN_ERROR(60007, "缺陷重新打开失败"),
    DEFECT_COMMENT_ERROR(60008, "缺陷评论失败"),
    DEFECT_ATTACHMENT_ERROR(60009, "缺陷附件错误"),
    DEFECT_WORKFLOW_ERROR(60010, "缺陷流程错误"),
    
    // ========== 报告相关错误 70000-79999 ==========
    REPORT_NOT_FOUND(70001, "报告不存在"),
    REPORT_ALREADY_EXISTS(70002, "报告已存在"),
    REPORT_GENERATE_ERROR(70003, "报告生成失败"),
    REPORT_EXPORT_ERROR(70004, "报告导出失败"),
    REPORT_TEMPLATE_NOT_FOUND(70005, "报告模板不存在"),
    REPORT_TEMPLATE_ERROR(70006, "报告模板错误"),
    REPORT_DATA_ERROR(70007, "报告数据错误"),
    REPORT_PERMISSION_DENIED(70008, "无报告权限"),
    REPORT_TYPE_ERROR(70009, "报告类型错误"),
    REPORT_SCHEDULE_ERROR(70010, "报告定时任务错误"),
    
    // ========== 系统相关错误 80000-89999 ==========
    SYSTEM_ERROR(80001, "系统错误"),
    SYSTEM_BUSY(80002, "系统繁忙"),
    SYSTEM_MAINTENANCE(80003, "系统维护中"),
    DATABASE_ERROR(80004, "数据库错误"),
    CACHE_ERROR(80005, "缓存错误"),
    NETWORK_ERROR(80006, "网络错误"),
    SERVICE_UNAVAILABLE(80007, "服务不可用"),
    SERVICE_TIMEOUT(80008, "服务超时"),
    THIRD_PARTY_ERROR(80009, "第三方服务错误"),
    CONFIG_ERROR(80010, "配置错误"),
    
    // ========== 其他错误 90000-99999 ==========
    UNKNOWN_ERROR(90001, "未知错误"),
    NOT_IMPLEMENTED(90002, "功能未实现"),
    DEPRECATED_API(90003, "接口已废弃"),
    API_LIMIT_EXCEEDED(90004, "接口调用次数超限"),
    RESOURCE_LIMIT_EXCEEDED(90005, "资源使用超限"),
    LICENSE_ERROR(90006, "许可证错误"),
    LICENSE_EXPIRED(90007, "许可证已过期"),
    VERSION_ERROR(90008, "版本错误"),
    PLATFORM_ERROR(90009, "平台错误"),
    BUSINESS_ERROR(90010, "业务错误");
    
    /**
     * 错误码
     */
    private final Integer code;
    
    /**
     * 错误信息
     */
    private final String message;
}
