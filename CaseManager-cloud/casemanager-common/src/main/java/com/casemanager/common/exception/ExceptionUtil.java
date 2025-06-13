package com.casemanager.common.exception;

import com.casemanager.common.api.IErrorCode;
import com.casemanager.common.enums.BusinessErrorCode;

/**
 * 异常工具类
 * 提供便捷的异常抛出方法
 */
public class ExceptionUtil {
    
    /**
     * 抛出业务异常
     *
     * @param errorCode 错误码
     */
    public static void throwBizException(IErrorCode errorCode) {
        throw new BusinessException(errorCode);
    }
    
    /**
     * 抛出业务异常
     *
     * @param errorCode 错误码
     * @param message   自定义错误信息
     */
    public static void throwBizException(IErrorCode errorCode, String message) {
        throw new BusinessException(errorCode, message);
    }
    
    /**
     * 抛出业务异常
     *
     * @param code    错误码
     * @param message 错误信息
     */
    public static void throwBizException(Integer code, String message) {
        throw new BusinessException(code, message);
    }
    
    /**
     * 抛出业务异常
     *
     * @param message 错误信息
     */
    public static void throwBizException(String message) {
        throw new BusinessException(message);
    }
    
    /**
     * 抛出业务异常
     *
     * @param errorCode 错误码
     * @param data      错误数据
     */
    public static void throwBizException(IErrorCode errorCode, Object data) {
        throw new BusinessException(errorCode, data);
    }
    
    /**
     * 抛出业务异常
     *
     * @param code    错误码
     * @param message 错误信息
     * @param data    错误数据
     */
    public static void throwBizException(Integer code, String message, Object data) {
        throw new BusinessException(code, message, data);
    }
    
    /**
     * 抛出参数错误异常
     */
    public static void throwParamError() {
        throw new BusinessException(BusinessErrorCode.PARAM_ERROR);
    }
    
    /**
     * 抛出参数错误异常
     *
     * @param message 自定义错误信息
     */
    public static void throwParamError(String message) {
        throw new BusinessException(BusinessErrorCode.PARAM_ERROR, message);
    }
    
    /**
     * 抛出数据不存在异常
     */
    public static void throwDataNotFound() {
        throw new BusinessException(BusinessErrorCode.DATA_NOT_FOUND);
    }
    
    /**
     * 抛出数据不存在异常
     *
     * @param message 自定义错误信息
     */
    public static void throwDataNotFound(String message) {
        throw new BusinessException(BusinessErrorCode.DATA_NOT_FOUND, message);
    }
    
    /**
     * 抛出数据已存在异常
     */
    public static void throwDataAlreadyExists() {
        throw new BusinessException(BusinessErrorCode.DATA_ALREADY_EXISTS);
    }
    
    /**
     * 抛出数据已存在异常
     *
     * @param message 自定义错误信息
     */
    public static void throwDataAlreadyExists(String message) {
        throw new BusinessException(BusinessErrorCode.DATA_ALREADY_EXISTS, message);
    }
    
    /**
     * 抛出操作不允许异常
     */
    public static void throwOperationNotAllowed() {
        throw new BusinessException(BusinessErrorCode.OPERATION_NOT_ALLOWED);
    }
    
    /**
     * 抛出操作不允许异常
     *
     * @param message 自定义错误信息
     */
    public static void throwOperationNotAllowed(String message) {
        throw new BusinessException(BusinessErrorCode.OPERATION_NOT_ALLOWED, message);
    }
    
    /**
     * 抛出用户未登录异常
     */
    public static void throwUserNotLogin() {
        throw new BusinessException(BusinessErrorCode.USER_NOT_LOGIN);
    }
    
    /**
     * 抛出用户权限不足异常
     */
    public static void throwPermissionDenied() {
        throw new BusinessException(BusinessErrorCode.USER_PERMISSION_DENIED);
    }
    
    /**
     * 抛出用户权限不足异常
     *
     * @param message 自定义错误信息
     */
    public static void throwPermissionDenied(String message) {
        throw new BusinessException(BusinessErrorCode.USER_PERMISSION_DENIED, message);
    }
    
    /**
     * 断言为真，否则抛出业务异常
     *
     * @param condition 条件
     * @param errorCode 错误码
     */
    public static void assertTrue(boolean condition, IErrorCode errorCode) {
        if (!condition) {
            throw new BusinessException(errorCode);
        }
    }
    
    /**
     * 断言为真，否则抛出业务异常
     *
     * @param condition 条件
     * @param errorCode 错误码
     * @param message   自定义错误信息
     */
    public static void assertTrue(boolean condition, IErrorCode errorCode, String message) {
        if (!condition) {
            throw new BusinessException(errorCode, message);
        }
    }
    
    /**
     * 断言为假，否则抛出业务异常
     *
     * @param condition 条件
     * @param errorCode 错误码
     */
    public static void assertFalse(boolean condition, IErrorCode errorCode) {
        if (condition) {
            throw new BusinessException(errorCode);
        }
    }
    
    /**
     * 断言为假，否则抛出业务异常
     *
     * @param condition 条件
     * @param errorCode 错误码
     * @param message   自定义错误信息
     */
    public static void assertFalse(boolean condition, IErrorCode errorCode, String message) {
        if (condition) {
            throw new BusinessException(errorCode, message);
        }
    }
    
    /**
     * 断言不为空，否则抛出业务异常
     *
     * @param object    对象
     * @param errorCode 错误码
     */
    public static void assertNotNull(Object object, IErrorCode errorCode) {
        if (object == null) {
            throw new BusinessException(errorCode);
        }
    }
    
    /**
     * 断言不为空，否则抛出业务异常
     *
     * @param object    对象
     * @param errorCode 错误码
     * @param message   自定义错误信息
     */
    public static void assertNotNull(Object object, IErrorCode errorCode, String message) {
        if (object == null) {
            throw new BusinessException(errorCode, message);
        }
    }
    
    /**
     * 断言为空，否则抛出业务异常
     *
     * @param object    对象
     * @param errorCode 错误码
     */
    public static void assertNull(Object object, IErrorCode errorCode) {
        if (object != null) {
            throw new BusinessException(errorCode);
        }
    }
    
    /**
     * 断言为空，否则抛出业务异常
     *
     * @param object    对象
     * @param errorCode 错误码
     * @param message   自定义错误信息
     */
    public static void assertNull(Object object, IErrorCode errorCode, String message) {
        if (object != null) {
            throw new BusinessException(errorCode, message);
        }
    }
}
