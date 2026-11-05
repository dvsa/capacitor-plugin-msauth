// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "DvsaCapacitorPluginMsauth",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "DvsaCapacitorPluginMsauth",
            targets: ["MsAuthPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/AzureAD/microsoft-authentication-library-for-objc.git", from: "1.7.0")
    ],
    targets: [
        .target(
            name: "MsAuthPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "MSAL", package: "microsoft-authentication-library-for-objc")
            ],
            path: "ios/Sources/MsAuthPlugin"),
        .testTarget(
            name: "MsAuthPluginTests",
            dependencies: ["MsAuthPlugin"],
            path: "ios/Tests/MsAuthPluginTests")
    ]
)
