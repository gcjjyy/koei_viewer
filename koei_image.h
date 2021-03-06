#ifndef __KOEI_IMAGE_H__
#define __KOEI_IMAGE_H__

#include <stdint.h>

#include "buf_reader.h"

typedef struct
{
    uint8_t r;
    uint8_t g;
    uint8_t b;
} __attribute__((packed)) rgb_t;

typedef struct
{
    int width;
    int height;
    uint8_t *buf;
} __attribute__((packed)) image_t;

uint8_t bit_from_bytes(uint8_t *bytes, int position);
rgb_t index_to_rgb(int index);
rgb_t get_palette(uint8_t index);
void free_image(image_t *image);

int read_palette(const char *filename);
int read_image(uint8_t *buf, image_t *image, int width, int height, int align_length, int bpp, int left_to_right);
int get_index_image(image_t *image, int row, int col);

#endif
