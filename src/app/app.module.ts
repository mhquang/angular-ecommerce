import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ProductService } from './services/product.service';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';

@NgModule({
  imports: [RouterModule.forRoot(routes), BrowserModule],
  providers: [ProductService],
})
export class AppModule {}
