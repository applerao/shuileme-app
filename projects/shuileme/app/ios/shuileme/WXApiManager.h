//
//  WXApiManager.h
//  shuileme
//
//  微信登录回调管理器
//

#import <Foundation/Foundation.h>
#import "WXApi.h"

@interface WXApiManager : NSObject <WXApiDelegate>

+ (instancetype)sharedManager;

@end
