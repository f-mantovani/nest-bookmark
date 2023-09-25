import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DatabaseService } from '../src/database/database.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let database: DatabaseService;
  const baseUrl = 'http://localhost:3333';
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    database = app.get(DatabaseService);

    await database.cleanDB();
    pactum.request.setBaseUrl(baseUrl);
  });

  afterAll(() => {
    app.close();
  });
  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'felipe@gmail.com',
      password: 'secret-pasword',
    };

    const diffDto: AuthDto = {
      email: 'felipe2@gmail.com',
      password: 'password-secret',
    };

    describe('Signup', () => {
      it('should signup', async () => {
        return await pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });

      it('should signup different account', async () => {
        return await pactum
          .spec()
          .post('/auth/signup')
          .withBody(diffDto)
          .expectStatus(201);
      });

      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it('should throw if no body is provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
    });

    describe('Login', () => {
      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it('should throw if no body is provided', () => {
        return pactum.spec().post('/auth/login').expectStatus(400);
      });

      it('should login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('token', 'access_token');
      });

      it('should login different account', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(diffDto)
          .expectStatus(200)
          .stores('diffToken', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get profile', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/profile')
          .withBearerToken('$S{token}')
          .expectStatus(200);
      });
    });

    describe('Edit User', () => {
      it('should edit', () => {
        const dto: EditUserDto = {
          firstName: 'Felipe',
          email: 'felipe@tutorial.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withBearerToken('$S{token}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken('$S{token}')
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });

    describe('Create Bookmark', () => {
      it('should create bookmarks', () => {
        const dto: CreateBookmarkDto = {
          title: 'First bookmark',
          link: 'https://deploy.equinix.com/blog/a-cloud-architects-guide-to-kubernetes-microservices/?ls=Advertising%20-%20Web&lsd=23q3_cross-vertical_no-program--metal_/blog/a-cloud-architects-guide-to-kubernetes-microservices/_metal-ent_Equinix-run_programmatic-display_carbon-ads_us-en__baremetal-microservices_demand-gen&utm_campaign=us-en_carbon-ads_programmatic-display_baremetal-microservices_metal-ent&utm_source=carbon-ads&utm_medium=programmatic-display&utm_content=no-program--metal_BM-C09-05',
        };
        return pactum
          .spec()
          .post('/bookmarks')
          .withBearerToken('$S{token}')
          .withBody({ ...dto })
          .expectStatus(201)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.link)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get Bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken('$S{token}')
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get Bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{token}')
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit Bookmark by id', () => {
      it(`shouldn't edit bookmark by id`, () => {
        const dto: EditBookmarkDto = {
          title: 'Updated title',
          link: 'http://updatedurl/com',
        };
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{diffToken}')
          .withBody(dto)
          .expectStatus(403)
          .expectBodyContains('Access to resource denied');
      });

      it('should edit bookmark by id', () => {
        const dto: EditBookmarkDto = {
          title: 'Updated title',
          link: 'http://updatedurl/com',
        };
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{token}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.link);
      });
    });

    describe('Delete Bookmark by id', () => {
      it(`shouldn't delete bookmark by id`, () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{diffToken}')
          .expectStatus(403)
          .expectBodyContains('Access to resource denied');
      });

      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{token}')
          .expectStatus(204);
      });
    });

    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken('$S{token}')
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
