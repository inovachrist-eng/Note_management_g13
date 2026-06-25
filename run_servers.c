#include <stdio.h>
#include <stdlib.h>

#ifdef _WIN32
#include <direct.h>
#define chdir _chdir
#else
#include <unistd.h>
#endif

int main(void) {
#ifdef _WIN32
    if (system("start \"PHP Server\" cmd /k \"cd backend && php artisan serve\"") != 0) {
        fprintf(stderr, "Failed to start PHP server\n");
        return 1;
    }

    if (system("start \"Frontend Dev\" cmd /k \"cd frontend && npm run dev\"") != 0) {
        fprintf(stderr, "Failed to start frontend dev server\n");
        return 1;
    }
#else
    if (system("cd backend && php artisan serve &") != 0) {
        fprintf(stderr, "Failed to start PHP server\n");
        return 1;
    }   

    if (system("cd frontend && npm run dev &") != 0) {
        fprintf(stderr, "Failed to start frontend dev server\n");
        return 1;
    }
#endif

    return 0;
}
