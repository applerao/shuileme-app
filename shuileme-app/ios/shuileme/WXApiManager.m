//
//  WXApiManager.m
//  shuileme
//
//  微信登录回调管理器实现
//

#import "WXApiManager.h"
#import <React/RCTEventEmitter.h>

@interface WXApiManager ()
@property (nonatomic, strong) RCTPromiseResolveBlock loginPromiseResolve;
@property (nonatomic, strong) RCTPromiseRejectBlock loginPromiseReject;
@end

@implementation WXApiManager

+ (instancetype)sharedManager {
    static WXApiManager *manager = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        manager = [[WXApiManager alloc] init];
    });
    return manager;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        // 注册微信 AppID
        NSString *appId = @"wxXXXXXXXXXXXXXXXX"; // 替换为实际的 AppID
        [WXApi registerApp:appId];
    }
    return self;
}

/**
 * 发起微信登录授权
 */
- (void)loginWithResolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    self.loginPromiseResolve = resolve;
    self.loginPromiseReject = reject;
    
    // 发送授权请求
    SendAuthReq *req = [[SendAuthReq alloc] init];
    req.scope = @"snsapi_userinfo";
    req.state = @"shuileme_wechat_login";
    
    [WXApi sendReq:req];
}

#pragma mark - WXApiDelegate

/**
 * 微信授权响应回调
 */
- (void)onResp:(BaseResp*)resp {
    if ([resp isKindOfClass:[SendAuthResp class]]) {
        SendAuthResp *authResp = (SendAuthResp *)resp;
        
        if (authResp.errCode == 0) {
            // 授权成功，返回 code
            if (self.loginPromiseResolve) {
                self.loginPromiseResolve(authResp.code);
            }
        } else {
            // 授权失败
            NSString *errorMessage = [self errorMessageForCode:authResp.errCode];
            if (self.loginPromiseReject) {
                self.loginPromiseReject(@"WECHAT_AUTH_ERROR", errorMessage, nil);
            }
        }
        
        // 清除 promise
        self.loginPromiseResolve = nil;
        self.loginPromiseReject = nil;
    }
}

/**
 * 微信请求回调（用于分享等功能）
 */
- (void)onReq:(BaseReq*)req {
    // 处理微信发来的请求（如分享消息到应用）
    NSLog(@"收到微信请求：%@", req);
}

/**
 * 获取错误信息
 */
- (NSString *)errorMessageForCode:(int)code {
    switch (code) {
        case -1:
            return @"授权失败，请重试";
        case -2:
            return @"用户取消授权";
        case 400:
            return @"请求错误";
        case 401:
            return @"签名错误";
        case 402:
            return @"客户端版本过旧";
        case 403:
            return @"权限不足";
        case 404:
            return @"网络错误";
        default:
            return [NSString stringWithFormat:@"未知错误 (code: %d)", code];
    }
}

@end
