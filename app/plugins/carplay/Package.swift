// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorCarplayLocal",
    platforms: [.iOS(.v16)],
    products: [
        .library(name: "CapacitorCarplayLocal", targets: ["CarPlayPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "CarPlayPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/CarPlayPlugin")
    ]
)
