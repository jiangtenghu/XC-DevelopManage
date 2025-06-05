package com.casemanager.common.api;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 通用API响应结果
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 状态码
     */
    private Integer code;
    
    /**
     * 返回消息
     */
    private String message;
    
    /**
     * 返回数据
     */
    private T data;
    
    /**
     * 是否成功
     */
    private boolean success;
    
    /**
     * 成功返回结果
     *
     * @param data 返回数据
     * @return API响应
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .code(ResultCode.SUCCESS.getCode())
                .message(ResultCode.SUCCESS.getMessage())
                .data(data)
                .success(true)
                .build();
    }
    
    /**
     * 成功返回结果
     *
     * @param data    返回数据
     * @param message 返回消息
     * @return API响应
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .code(ResultCode.SUCCESS.getCode())
                .message(message)
                .data(data)
                .success(true)
                .build();
    }
    
    /**
     * 失败返回结果
     *
     * @param errorCode 错误码
     * @return API响应
     */
    public static <T> ApiResponse<T> failed(IErrorCode errorCode) {
        return ApiResponse.<T>builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .success(false)
                .build();
    }
    
    /**
     * 失败返回结果
     *
     * @param errorCode 错误码
     * @param message   错误消息
     * @return API响应
     */
    public static <T> ApiResponse<T> failed(IErrorCode errorCode, String message) {
        return ApiResponse.<T>builder()
                .code(errorCode.getCode())
                .message(message)
                .success(false)
                .build();
    }
    
    /**
     * 失败返回结果
     *
     * @param message 错误消息
     * @return API响应
     */
    public static <T> ApiResponse<T> failed(String message) {
        return ApiResponse.<T>builder()
                .code(ResultCode.FAILED.getCode())
                .message(message)
                .success(false)
                .build();
    }
    
    /**
     * 失败返回结果
     *
     * @return API响应
     */
    public static <T> ApiResponse<T> failed() {
        return failed(ResultCode.FAILED);
    }
    
    /**
     * 参数验证失败返回结果
     *
     * @return API响应
     */
    public static <T> ApiResponse<T> validateFailed() {
        return failed(ResultCode.VALIDATE_FAILED);
    }
    
    /**
     * 参数验证失败返回结果
     *
     * @param message 错误消息
     * @return API响应
     */
    public static <T> ApiResponse<T> validateFailed(String message) {
        return ApiResponse.<T>builder()
                .code(ResultCode.VALIDATE_FAILED.getCode())
                .message(message)
                .success(false)
                .build();
    }
    
    /**
     * 未登录返回结果
     *
     * @return API响应
     */
    public static <T> ApiResponse<T> unauthorized() {
        return failed(ResultCode.UNAUTHORIZED);
    }
    
    /**
     * 未授权返回结果
     *
     * @return API响应
     */
    public static <T> ApiResponse<T> forbidden() {
        return failed(ResultCode.FORBIDDEN);
    }
}
