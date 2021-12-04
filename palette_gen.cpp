#include <stdio.h>
#include <stdint.h>

// BGR Based

uint8_t sam4_kao_pal[8 * 3] = {
    0x2f, 0x1f, 0x00,
    0x1f, 0x3f, 0x7f,
    0xaf, 0x3f, 0x1f,
    0xbf, 0x7f, 0x4f,
    0x3f, 0x6f, 0x1f,
    0x3f, 0x7f, 0x8f,
    0xff, 0xaf, 0x7f,
    0xcf, 0xcf, 0xaf};

uint8_t sam3_kao_pal[8 * 3] = {
    0x00, 0x00, 0x00,
    0x00, 0x3f, 0xef,
    0xef, 0x4f, 0x00,
    0xef, 0x4f, 0xcf,
    0x0f, 0xaf, 0x4f,
    0x00, 0xbf, 0xef,
    0xef, 0xdf, 0x00,
    0xef, 0xef, 0xef};

uint8_t horizon_kao_pal[8 * 3] = {
    0x00, 0x00, 0x00,
    0x00, 0xa0, 0x60,
    0xd0, 0x40, 0x00,
    0xf0, 0xa0, 0x60,
    0x00, 0x40, 0xd0,
    0x00, 0xa0, 0xf0,
    0xd0, 0x60, 0xa0,
    0xf0, 0xe0, 0xd0};

uint8_t hero_pal[16 * 3] = {
    0x00, 0x00, 0x00,
    0x00, 0x00, 0x00,
    0x00, 0xB8, 0x74,
    0x30, 0x88, 0xFC,
    0xEC, 0x64, 0x00,
    0x64, 0x64, 0x10,
    0xFC, 0xCC, 0x54,
    0x98, 0xB8, 0x20,
    0x20, 0x44, 0xA8,
    0xA8, 0x64, 0x20,
    0x88, 0xCC, 0xFC,
    0xA8, 0xA8, 0x88,
    0xCC, 0x74, 0xA8,
    0x10, 0x88, 0x00,
    0xFC, 0xFC, 0xFC,
    0xFC, 0xEC, 0xA8};

uint8_t rpgmk_pal[16 * 3] = {
    0x00, 0x50, 0x50,
    0x60, 0x60, 0x70,
    0xf0, 0x70, 0xb0,
    0x00, 0x50, 0xf0,
    0xf0, 0xe0, 0x20,
    0x90, 0x30, 0x10,
    0xf0, 0xc0, 0x80,
    0xe0, 0x80, 0x50,
    0xa0, 0xa0, 0xc0,
    0x00, 0x00, 0x90,
    0xe0, 0x30, 0x00,
    0xa0, 0x00, 0xc0,
    0x00, 0xa0, 0x50,
    0x00, 0xc0, 0xf0,
    0x00, 0x00, 0x00,
    0xf0, 0xf0, 0xf0};

int main(int argc, char *argv[])
{
    FILE *fp = fopen("SAM3KAO.PAL", "wb");
    fwrite(sam3_kao_pal, 1, 8 * 3, fp);
    fclose(fp);

    fp = fopen("SAM4KAO.PAL", "wb");
    fwrite(sam4_kao_pal, 1, 8 * 3, fp);
    fclose(fp);

    fp = fopen("HORIZON_KAO.PAL", "wb");
    fwrite(horizon_kao_pal, 1, 8 * 3, fp);
    fclose(fp);

    fp = fopen("HERO.PAL", "wb");
    fwrite(hero_pal, 1, 16 * 3, fp);
    fclose(fp);

    fp = fopen("RPGMK.PAL", "wb");
    fwrite(rpgmk_pal, 1, 16 * 3, fp);
    fclose(fp);

    return 0;
}
