import unittest

from PIL import Image, ImageDraw
from review import contrast, inspect_svg, optical


def svg(contents, bounds="0 0 48 48"):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{bounds}">{contents}</svg>'.encode()


class LogoInspection(unittest.TestCase):
    def test_geometry_and_type_report(self):
        value = inspect_svg(svg('<path d="M0 0 L48 48"/><text>Live</text>'))
        self.assertEqual(value["viewBox"], [0, 0, 48, 48])
        self.assertEqual(value["path_count"], 1)
        self.assertEqual(value["flags"], ["live type"])

    def test_unsafe_or_unbounded_source_fails(self):
        for source in (
            svg('<script/>'),
            svg('<use href="https://example.com/asset.svg"/>'),
            svg('<path fill="url(https://example.com/asset.svg)"/>'),
            svg('<path id="x"/><path id="x"/>'),
            svg('<path onload="a()"/>'),
            svg('<path/>', '0 0 NaN 48'),
            svg('<path/>', '0 0 0 48'),
        ):
            with self.subTest(source=source), self.assertRaises(ValueError):
                inspect_svg(source)

    def test_alpha_measurements_distinguish_clipped_corner(self):
        image = Image.new("RGBA", (16, 16))
        ImageDraw.Draw(image).rectangle((0, 0, 2, 2), fill="white")
        measured = optical(image, image)
        self.assertTrue(measured["edge_touch"])
        self.assertGreater(measured["circle_loss_pct"], 50)
        self.assertEqual(measured["alpha_iou_vs_512"], 1)
        self.assertEqual(measured["centroid_px"], [1.5, 1.5])

    def test_contrast_of_opaque_colors(self):
        self.assertEqual(contrast("#FFFFFF", "#000000"), 21)
        self.assertEqual(contrast("#070A10", "#070A10"), 1)

    def test_blank_svg_is_not_a_specimen(self):
        image = Image.new("RGBA", (16, 16))
        with self.assertRaisesRegex(ValueError, "no pixels"):
            optical(image, image)


if __name__ == "__main__":
    unittest.main()
