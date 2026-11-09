// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "DvsaCapacitorPluginMsauth",
    platforms: [.iOS(.v17)],
    products: [
        .library(
            name: "DvsaCapacitorPluginMsauth",
            targets: ["DvsaCapacitorPluginMsauth"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.6.0"),
        .package(url: "https://github.com/AzureAD/microsoft-authentication-library-for-objc.git", from: "2.16.0")
    ],
    targets: [
        .target(
            name: "DvsaCapacitorPluginMsauth",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "MSAL", package: "microsoft-authentication-library-for-objc")
            ],
            path: "ios/Sources/DvsaCapacitorPluginMsauth"),
        .testTarget(
            name: "DvsaCapacitorPluginMsauthTests",
            dependencies: ["DvsaCapacitorPluginMsauth"],
            path: "ios/Tests/DvsaCapacitorPluginMsauthTests")
    ]
)
