// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorUnityAdsLocal",
    platforms: [.iOS(.v16)],
    products: [
        .library(name: "CapacitorUnityAdsLocal", targets: ["UnityAdsPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/Unity-Technologies/unity-ads-swift-package.git", exact: "4.20.0")
    ],
    targets: [
        .target(
            name: "UnityAdsPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "UnityAds", package: "unity-ads-swift-package")
            ],
            path: "ios/Sources/UnityAdsPlugin")
    ]
)
