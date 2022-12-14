import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/AllExceptionsFilter.filter';
import { TransformInterceptor } from './interceptors/translation.interceptor';
import { ConfigServices } from './shared/services/app-settings.service';
import { SharedModule } from './shared/shared.module';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.use(
    session({
      name: 'PAY_SESSION',
      secret: process.env.COOKIE_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 1000 * 60 },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const configService = app.select(SharedModule).get(ConfigServices);
  const port = configService.getAppPort().port;

  try {
    await app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

bootstrap();
