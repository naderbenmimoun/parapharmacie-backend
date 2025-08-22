import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductsComponent } from './products/products.component';
import { CartComponent } from './cart/cart.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderConfirmationComponent } from './order-confirmation/order-confirmation.component';
import { FaceAnalysisComponent } from './face-analysis/face-analysis.component';
import { ProfileComponent } from './profile/profile.component';


export const routes: Routes = [
    { path: "", redirectTo: "home", pathMatch: "full" },
    { path: "home", title: "Home", component: HomeComponent },
    { path: "login", title: "Login", component: LoginComponent },
    { path: "signup", title: "Inscription", component: SignupComponent },
    { path: "products", title: "Produits", component: ProductsComponent },
    { path: "product/:id", title: "Détail Produit", component: ProductDetailComponent },
    { path: "cart", title: "Panier", component: CartComponent },
    { path: "checkout", title: "Checkout", component: CheckoutComponent },
    { path: "order-confirmation", title: "Commande confirmée", component: OrderConfirmationComponent },
    { path: "favorites", title: "Mes Favoris", component: FavoritesComponent },
    { path: "product_detail", title: "Product_detail", component: ProductDetailComponent },
    { path: "forgotPassword", title: "forgotPassword", component: ForgotPasswordComponent },
    { path: "face-analysis", title: "Analyse Faciale", component: FaceAnalysisComponent },
    { path: "profile", title: "Mon Profil", component: ProfileComponent }
];